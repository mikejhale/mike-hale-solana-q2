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
import { WbaVault, IDL } from './wba_vault';
import wallet from '../wba-wallet.json';

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

(async () => {
  try {
    const txhash = await program.methods
      .deposit(new BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState,
        vaultAuth: vaultAuth,
        vault: vault,
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
