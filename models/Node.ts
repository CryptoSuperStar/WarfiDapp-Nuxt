import * as ethers from 'ethers';
import { PAYOUTS_PER_DAY } from '~/models/constants';
import { BigNumber } from 'ethers';

export interface Node {
    //--- Base attributes
    owner : string;
    tokenId:BigNumber;
    creationTime : Date;
    lastClaimTime : Date;
    obtainingTime : Date;
    isBoostedAirDropRate : ethers.BigNumber;
    isBoostedNft : boolean;
    isBoostedToken : boolean;
    feature : string;
    //--- Reward computation related
    accumulatedRewards : ethers.BigNumber;
    lastRewardUpdateTime : ethers.BigNumber;
    lastLifetime : ethers.BigNumber
    fertilizerCreationTime : Date[];
    fertilizerDuration : ethers.BigNumber[];
    fertilizerBoost: ethers.BigNumber[];
    plotAdditionalLifetime : ethers.BigNumber;
    nodeType : string;
}