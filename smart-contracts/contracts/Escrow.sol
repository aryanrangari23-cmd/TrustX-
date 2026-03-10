// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    struct Project {
        uint id;
        string title;
        address client;
        address payable freelancer;
        uint budget;
        uint balance;
        bool isCompleted;
    }

    uint public projectCount = 0;
    mapping(uint => Project) public projects;

    event ProjectCreated(uint id, string title, address client, address freelancer, uint budget);
    event FundsDeposited(uint projectId, uint amount);
    event PaymentReleased(uint projectId, uint amount);

    function createProject(string memory _title, address payable _freelancer) public payable {
        projectCount++;
        projects[projectCount] = Project(
            projectCount,
            _title,
            msg.sender,
            _freelancer,
            msg.value,
            msg.value,
            false
        );
        emit ProjectCreated(projectCount, _title, msg.sender, _freelancer, msg.value);
    }

    function depositFunds(uint _projectId) public payable {
        Project storage p = projects[_projectId];
        require(msg.sender == p.client, "Only client can deposit funds");
        require(!p.isCompleted, "Project is already completed");
        p.balance += msg.value;
        p.budget += msg.value;
        emit FundsDeposited(_projectId, msg.value);
    }

    function releasePayment(uint _projectId, uint _amount) public {
        Project storage p = projects[_projectId];
        require(msg.sender == p.client, "Only client can release payment");
        require(!p.isCompleted, "Project already completed");
        require(p.balance >= _amount, "Insufficient balance");
        
        p.balance -= _amount;
        
        if (p.balance == 0) {
            p.isCompleted = true;
        }

        p.freelancer.transfer(_amount);
        emit PaymentReleased(_projectId, _amount);
    }

    function getProject(uint _projectId) public view returns (
        uint id, string memory title, address client, address freelancer, uint budget, uint balance, bool isCompleted
    ) {
        Project storage p = projects[_projectId];
        return (p.id, p.title, p.client, p.freelancer, p.budget, p.balance, p.isCompleted);
    }
}
