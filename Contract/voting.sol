// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Voting {
    struct Issue {
        uint id;
        string description;
        uint optionsCount;
        mapping(uint => Option) options;
        mapping(address => bool) voters;
    }

    struct Option {
        uint id;
        string description;
        uint voteCount;
    }

    IERC721 public nft;
    address public admin;
    uint public issuesCount;
    mapping(uint => Issue) public issues;

    event IssueCreated(uint indexed _issueId);
    event Voted(uint indexed _issueId, uint indexed _optionId);

    constructor(address _nftAddress) {
        nft = IERC721(_nftAddress);
        admin = msg.sender;
    }

    function createIssue(
        string memory _description,
        string[] memory _options
    ) public {
        require(msg.sender == admin, "Only admin can create a new issue.");

        issuesCount++;
        Issue storage issue = issues[issuesCount];
        issue.id = issuesCount;
        issue.description = _description;
        issue.optionsCount = _options.length;

        for (uint i = 0; i < _options.length; i++) {
            issue.options[i + 1] = Option(i + 1, _options[i], 0);
        }

        emit IssueCreated(issuesCount);
    }

    function vote(
        uint _issueId,
        uint _optionId
    ) public {
        Issue storage issue = issues[_issueId];
        require(
            !issue.voters[msg.sender],
            "You have already voted on this issue."
        );
        require(
            _optionId > 0 && _optionId <= issue.optionsCount,
            "Invalid option."
        );

        uint256 nftCount = nft.balanceOf(msg.sender);
        require(nftCount > 0, "You must own an NFT to vote.");

        issue.voters[msg.sender] = true;
        issue.options[_optionId].voteCount += nftCount;

        emit Voted(_issueId, _optionId);
    }

    function getOption(
        uint _issueId,
        uint _optionId
    ) public view returns (uint id, string memory description, uint voteCount) {
        require(_issueId > 0 && _issueId <= issuesCount, "Invalid issue.");
        Issue storage issue = issues[_issueId];
        require(
            _optionId > 0 && _optionId <= issue.optionsCount,
            "Invalid option."
        );

        Option storage option = issue.options[_optionId];
        return (option.id, option.description, option.voteCount);
    }
}
