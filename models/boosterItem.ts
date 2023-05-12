import { BigNumber } from 'ethers';
export interface WaterPackType { 
    name: string;
    ratioOfGRP: BigNumber;
    prices: BigNumber[];
}

export interface FertilizerType {
    name: string;
    durationEffect: BigNumber;
    rewardBoost:BigNumber;
    prices: BigNumber[];
    globalLimit: BigNumber;
    nodeLimit: BigNumber;
    userNodeTypeLimit: BigNumber;
}

export interface BoosterItemPrice {
    boosterType: string;
    name: string;
    nodeType: string;
    price: string;
}

export interface BoosterItemLog {
    // tokenId: BigNumber;
    boosterType: string;
    name: string;
    activeTime: number;

}

export interface BoosterItemListLog {
    tokenId: BigNumber;
    logList : BoosterItemLog[];
}