// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./RewardProfile.sol";
import "./Percentage.sol";
import "./Math.sol";
// import "hardhat/console.sol";

struct Node {
    //--- Base attributes
    address owner;
    uint256 creationTime;
    uint256 lastClaimTime;
    uint256 obtainingTime;
    uint256 isBoostedAirDropRate;
    bool isBoostedNft;
    bool isBoostedToken;
    string feature;
    //--- Reward computation related
    uint256 accumulatedRewards;
    uint256 lastRewardUpdateTime;
    uint256 lastLifetime;

    uint256[] fertilizerCreationTime;
    uint256[] fertilizerDuration;
    UPercentage[] fertilizerBoost;

    uint256 plotAdditionalLifetime;
}

abstract contract NodeRewards {
    using Percentages for UPercentage;

    function _price() internal view virtual returns (uint256);

    function _baseRewardsPerSecond() internal view virtual returns (uint256);

    function _timeToROI() internal view returns (uint256) {
        return _price() / _baseRewardsPerSecond();
    }

    function _initialLifetime() internal view returns (uint256) {
        return 2 * _timeToROI();
    }

    function _newNode() internal view returns (Node memory) {
        return Node({
            owner: address(0),
            creationTime: block.timestamp,
            lastClaimTime: block.timestamp,
            obtainingTime: block.timestamp,
            isBoostedAirDropRate: 0,
            isBoostedNft: false,
            isBoostedToken: false,
            feature: "",
            accumulatedRewards: 0,
            lastRewardUpdateTime: block.timestamp,
            lastLifetime: _initialLifetime(),
            fertilizerCreationTime: new uint256[](0),
            fertilizerDuration: new uint256[](0),
            fertilizerBoost: new UPercentage[](0),
            plotAdditionalLifetime: 0
        });
    }

    function _persistRewards(
        Node storage node
    )
        internal
    {
        // console.log("accumulatedRewards", node.accumulatedRewards);
        node.accumulatedRewards += 
            _calculateBaseNodeRewards(node) - node.accumulatedRewards;
        // console.log("accumulatedRewards", node.accumulatedRewards);
        // console.log("lastlifetime", node.lastLifetime);
        node.lastLifetime = Math.subOrZero(
            node.lastLifetime,
            Math.subOrZero(block.timestamp, node.lastRewardUpdateTime)
        );
        // console.log("lastlifetime", node.lastLifetime);
        node.lastRewardUpdateTime = block.timestamp;

        // console.log("Current time:    ", block.timestamp);
        for(uint i = 0; i < node.fertilizerBoost.length; i++) {
            // console.log("Fertilizer", i);
            // console.log("Expiration time: ", node.fertilizerCreationTime[i] + node.fertilizerDuration[i]);
            if (block.timestamp > (node.fertilizerCreationTime[i] + node.fertilizerDuration[i])) {
                // console.log("Delete");
                node.fertilizerBoost[i] = node.fertilizerBoost[node.fertilizerBoost.length - 1];
                node.fertilizerBoost.pop();

                node.fertilizerCreationTime[i] = node.fertilizerCreationTime[node.fertilizerCreationTime.length - 1];
                node.fertilizerCreationTime.pop();

                node.fertilizerDuration[i] = node.fertilizerDuration[node.fertilizerDuration.length - 1];
                node.fertilizerDuration.pop();
            }
        }
    }

    function _extendLifetime(
        Node storage node,
        UPercentage ratioOfROIExtended
    )
        internal
    {
        _persistRewards(node);
        node.lastLifetime += ratioOfROIExtended.times(_timeToROI());
    }

    function _addFertilizer(
        Node storage node,
        uint256 durationEffect,
        UPercentage rewardBoost
    )
        internal
    {
        _persistRewards(node);
        node.fertilizerCreationTime.push(block.timestamp);
        node.fertilizerDuration.push(durationEffect);
        node.fertilizerBoost.push(rewardBoost);
        // console.log("Add fertilizer", node.fertilizerCreationTime.length - 1);
    }

    function _calculateBaseNodeRewards(Node memory node)
        internal
        view
        returns (uint256)
    {
        // console.log("now", block.timestamp);
        // console.log("Current lifetime: ", Math.subOrZero(node.lastLifetime, Math.subOrZero(block.timestamp, node.lastRewardUpdateTime)));
        // console.log("Alive since:      ", Math.subOrZero(block.timestamp, node.obtainingTime));
        uint256 baseRewards = ROIDependantRewardProfile.integrateRewardsFromLifetime(
                _price(),
                _baseRewardsPerSecond(),
                node.lastLifetime + node.plotAdditionalLifetime,
                Math.subOrZero(block.timestamp, node.lastRewardUpdateTime)
            ) + node.accumulatedRewards;

        // console.log("Accumulated:     ", node.accumulatedRewards);
        // console.log("Base rewards:    ", baseRewards - node.accumulatedRewards);
        for (uint256 i = 0; i < node.fertilizerBoost.length; i++) {
            // console.log("Fertilizer #", i);

            // Each fertilizer has a duration effect that is not dependant
            // on the lifetime of the node. However, the rewards might have
            // been accumulated from a previous operation. Therefore, we
            // need to remove the accumulated rewards from the fertilizer
            // boost calculation, hence computing the rewards from
            // now until the known end time of the fertilizer.
            uint256 fertilizerBoost = ROIDependantRewardProfile.integrateFertilizerAdditionalRewards(
                _baseRewardsPerSecond(),
                node.fertilizerBoost[i],
                Math.subOrZero(
                    node.fertilizerDuration[i] + node.fertilizerCreationTime[i],
                    node.lastRewardUpdateTime
                ),
                Math.subOrZero(block.timestamp, node.lastRewardUpdateTime)
            );

            // console.log("Fertilizer add:  ", fertilizerBoost);

            baseRewards += fertilizerBoost;
        }

        // console.log("Final            ", baseRewards);

        return baseRewards;
    }
}
