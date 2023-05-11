import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from '@coral-xyz/anchor';
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WbaVault, IDL } from './wba_vault';
import wallet from '../wba-wallet.json';
import { exit } from 'process';

/*
-Load the IDL for the WBA Vault
-Initialize an Account with WBA Vault
-Deposit native Solana
-Withdraw native Solana
-Deposit your SPL token
-Withdraw SPL token
-Each successful interaction increases your WBA Score.
*/

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
//const vaultState = Keypair.generate();

// Create a devnet connection
const connection = new Connection(
  'https://rpc-devnet.helius.xyz/?api-key=eb53a054-c1f1-4da9-8882-7497a3862901'
);

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: 'confirmed',
});

const program = new Program<WbaVault>(
  IDL,
  'G7QyuwYPAcwrJ7p1S86gGbtVPt9A93vUyrMpc5xKEmoA' as Address,
  provider
);

const vaultState = new PublicKey(
  'G395BBhEw2Qc6F29kjzwAest28G95pU9CV7iHRgYEkHk'
);
const vaultAuth = new PublicKey('3zAyWhAdgmJdacBjqHCAQWDGKjbX5ukdpZkhNVK9V513');
const vault = new PublicKey('6KS6rMvHs3SmU4X6raBc856NQb85u3ogUVdD5E4VrCNN');
const mint = new PublicKey('4XhveW32K81i9jNZ57xLVUEX3m2HguGM1Yz7mEdAHH9K');

(async () => {
  try {
    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true
    );

    console.log(vaultTokenAccount.address);

    const txhash = await program.methods
      .withdrawSpl(new BN(1000000))
      .accounts({
        owner: keypair.publicKey,
        ownerAta: ownerTokenAccount.address,
        vaultState: vaultState,
        vaultAuth: vaultAuth,
        vaultAta: vaultTokenAccount.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
