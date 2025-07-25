# World Computer Lottery Frontend

https://yhajg-kiaaa-aaaar-qbshq-cai.icp0.io/

This is a frontend that aims to improve the user experience for interacting with the World Computer Lottery. The backend canister is maintained in a [separate repo](https://github.com/aodl/WorldComputerLottery), as it's designed to be fully functional with minimal dependencies and easy to review and verify.

## How to Play

<img width="364" height="284" alt="image" src="https://github.com/user-attachments/assets/b66d93b5-2623-4351-ad20-487697292bfd" />

Players enter their chosen lottery numbers, copy the ticket reference that's produced, and use it as a memo in an ICP transfer to the canister's ledger account (ticktes cost 0.01 ICP).

Note that the NNS dapp will soon provide UI support for declaring a memo (reference number) for ICP transfers, meaning the World Computer Lottery can be played directly from a user's main wallet. This project has involved engaging with DFINITY and mocking up potential UI approaches. Examples below:

<img width="379" height="500" alt="image" src="https://github.com/user-attachments/assets/5ae3300f-ea7c-49d3-8fb3-e1c401d29fc4" />

<img width="347" height="499" alt="image" src="https://github.com/user-attachments/assets/5257ead3-31fa-444e-95af-b774f6561eac" />

-------

<img width="744" height="717" alt="image" src="https://github.com/user-attachments/assets/1603a9cf-e638-48b8-a01e-be92860e5ff6" />


The demo instance of the World Computer Lottery draws a new set of lottery numbers every minute. The production instance will be scheduled to draw lottery numbers every Friday at 8pm UTC.

The order of drawn balls is not important. Matching one ball entitles players to a small prize, which grows exponentially with the number of balls matched. Rewards are automatically transferred back to the account that purchased the winning ticket(s).

## Logs

Logs are also visible via the frontend.

<img width="994" height="605" alt="image" src="https://github.com/user-attachments/assets/a69c4290-b232-4e92-a553-2303cdfc1da1" />
