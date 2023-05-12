import { NodeNftNames } from "./types";

export const PAYOUTS_PER_DAY = 6;

export const NAME_TO_URL = {
  [NodeNftNames.Infantry]: "Infantry",
  [NodeNftNames.Rocketeer]: "Rocketeer",
  [NodeNftNames.HeavyGunner]: "Heavy Gunner",
  [NodeNftNames.Sniper]: "Sniper",
  [NodeNftNames.K9]: "K9",
  // [NodeNftNames.DogPack]: "Dog Pack",
  // [NodeNftNames.DockPack]: "Dock Pack",
};

export const URL_TO_NAME = {
  Infantry: NodeNftNames.Infantry,
  Rocketeer: NodeNftNames.Rocketeer,
  HeavyGunner: NodeNftNames.HeavyGunner,
  Sniper: NodeNftNames.Sniper,
  "K9": NodeNftNames.K9,
  // "DogPack": NodeNftNames.DogPack,
  // "DockPack": NodeNftNames.DockPack,
};

export type Url = "Infantry" | "Rocketeer" | "Heavy Gunner" | "Sniper" | "K9";

export const NODENAME_TO_IMAGE = {
  ["Infantry Lieutenant"]:
    "infantry_lieutenent.png",
  ["Infantry Captain"]:
    "5.png",
  ["Infantry Commander"]:
    "9.png",
  ["Infantry General"]:
    "1.png",
  ["Rocketeer Lieutenant"]:
    "rocketeer_lieutenent.png",
  ["Rocketeer Captain"]:
    "6.png",
  ["Rocketeer Commander"]:
    "10.png",
  ["Rocketeer General"]:
    "2.png",
  ["Heavy Gunner Lieutenant"]:
    "Heavy Gunner_lieutenent.png",
  ["Heavy Gunner Captain"]:
    "7.png",
  ["Heavy Gunner Commander"]:
    "11.png",
  ["Heavy Gunner General"]:
    "3.png",
  ["Sniper Lieutenant"]:
    "sniper_lieutenent.png",
  ["Sniper Captain"]:
    "8.png",
  ["Sniper Commander"]:
    "12.png",
  ["Sniper General"]:
    "4.png",
  ["K9 Lieutenant"]:
  "k9.png",
};

export const NODENAME_TO_VIDEO = {
  ["Infantry"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+1+-+Bonsai/Bonsai.mp4",
  ["Infantry Gold"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+1+-+Bonsai/Bonsai+Gold.mp4",
  ["Infantry Silver"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+1+-+Bonsai/Bonsai+Silver.mp4",
  ["Infantry Diamond"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+1+-+Bonsai/Bonsai+Diamond.mp4",
  ["Infantry Ruby"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+1+-+Bonsai/Bonsai+Ruby.mp4",
  ["Rocketeer"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+2+-+Fir/fir.mp4",
  ["Rocketeer Gold"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+2+-+Fir/Fir+Gold.mp4",
  ["Rocketeer Silver"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+2+-+Fir/Fir+silver.mp4",
  ["Rocketeer Diamond"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+2+-+Fir/Fir+Diamond.mp4",
  ["Rocketeer Ruby"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+2+-+Fir/Fir+Ruby.mp4",
  ["Heavy Gunner"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+3+-+Oak/oak.mp4",
  ["Heavy Gunner Gold"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+3+-+Oak/Oak+Gold.mp4",
  ["Heavy Gunner Silver"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+3+-+Oak/Oak+silve.mp4",
  ["Heavy Gunner Diamond"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+3+-+Oak/Oak+Diamond.mp4",
  ["Heavy Gunner Ruby"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+3+-+Oak/Oak+Ruby.mp4",
  ["Sniper"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+4+-+Cherry/Cherry.mp4",
  ["Sniper Gold"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+4+-+Cherry/Cherry+Gold.mp4",
  ["Sniper Silver"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+4+-+Cherry/Cherry+Silver.mp4",
  ["Sniper Diamond"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+4+-+Cherry/Cherry+Diamond.mp4",
  ["Sniper Ruby"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/NFT+4+-+Cherry/Cherry+Ruby.mp4",
};

export const LUCKY_BOX_VIDEOS = {
  ["Infantry Tent"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/SPRING+PLUM+BONSAI/GRAINE/LOOP.mp4",
  ["Rocketeer Tent"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+1/Seed+1+loop.mp4",
  ["Heavy Gunner Tent"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+2/Seed+2+loop.mp4",
  ["Sniper Tent"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+3/Seed+3+loop.mp4",
};

export const LUCKY_BOX_IMAGES = {
  ["Infantry Tent"]:
    "tent1.png",
  ["Rocketeer Tent"]:
    "tent2.png",
  ["Heavy Gunner Tent"]:
    "tent3.png",
  ["Sniper Tent"]:
    "tent4.png",
  ["Dog Pack Tent"]:
    "tentk9.png",
};
export const PLOT_VIDEOS = {
  ["Plum"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/plum+plot.mp4",
  ["Bonsai"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/anim+bonsai.mp4",
  ["Fir"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/anim+fir.mp4",
  ["Oak"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/anim+oak.mp4",
  ["Cherry"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/anim+cherry.mp4",
  
}
export const PLOT_IMAGES = {
  ["Genesis"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/basic+plot.png",
  ["Plum"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/plum+plot.jpeg",
  ["Bonsai"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/Ilot_Bonsai_v2.jpg",
  ["Fir"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/Ilot_Fir_v1.jpg",
  ["Oak"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/Ilot_4_v2.jpg",
  ["Cherry"]:
    "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Plots/Ilot_cherry0000.jpg",
};


export const BOOSITEM_VIDEOS = {
  // ["Fertilizer"]:
  //   "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Specials/Fertilizer.mp4",
  ["Waterpack"]:
    "ammo.png",
};

// export const LUCKYBOX_OPENVIDEO_BY_TYPE  = {
//   ["Plum Seed"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/SPRING+PLUM+BONSAI/GRAINE/OPENING.mp4",
//   ["Bonsai Seed"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+1/Seed+1+opening.mp4",
//   ["Fir Seed"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+2/Seed+2+opening.mp4",
//   ["Oak Seed"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+3/Seed+3+opening.mp4",
//   ["Cherry Seed"]: "https://d3d23y4h26vs3r.cloudfront.net/Full+assets+spring/Seed+4/Seed+4+opening.mp4"
// }
