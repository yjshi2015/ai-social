module ai_social::ai_social {

    use sui::coin::{Self};
    use std::string::{String};
    use std::ascii::{string};
    use sui::balance:: {Balance, Supply};
    use sui::url::{Self, Url};

    public struct AI_SOCIAL has drop {}

    public struct DisplayImages has key, store {
        id: UID,
        images: vector<ImageInfo>,
    }

    public struct ImageInfo has store, copy, drop {
        owner: address,
        blob_id: String,
        blob_obj: address,
    }

    public struct MemePool has key {
        id: UID,
        bal: Balance<AI_SOCIAL>,
        total_supply: Supply<AI_SOCIAL>,
    }

    fun init(witness: AI_SOCIAL, ctx: &mut TxContext) {
        // init empty display info
        let displayImages = DisplayImages {
            id: object::new(ctx),
            images: vector::empty<ImageInfo>(),
        };
        transfer::public_share_object(displayImages);


        // launch meme coins
        let (treasuryCap, metadata) = coin::create_currency<AI_SOCIAL>(
            witness, 9,
            b"social", b"social", b"ai social coin", 
            option::some<Url>(url::new_unsafe(string(b"https://aggregator.walrus-testnet.walrus.space/v1/Rhm6wRwDQ55Nr4hve6Aj9VXuZbjA9nwvrBtjFpOp_38"))),
            ctx);
        transfer::public_freeze_object(metadata);

        let mut supply = treasuryCap.treasury_into_supply();
        let bal = supply.increase_supply(10_000_000_000_000_000_000);

        // init Meme Pool
        let memePool = MemePool {
            id: object::new(ctx),
            bal: bal,
            total_supply: supply,
        };
        transfer::share_object(memePool);
    }

    #[allow(lint(self_transfer))]
    public fun record_and_reward(
        blob_id: String,
        blob_obj: address,
        display_img: &mut DisplayImages,
        amount: u64,
        pool: &mut MemePool,
        ctx: &mut TxContext,
    ) {
        let imageInfo = ImageInfo { owner: ctx.sender(),blob_id, blob_obj };
        let len = display_img.images.length();
        display_img.images.insert(imageInfo, len);

        let rewards = pool.bal.split(amount);
        transfer::public_transfer(rewards.into_coin(ctx), ctx.sender());
    }

//     public fun public_key(house_data: &HouseData): vector<u8> {
//     house_data.public_key
//   }
}
