import { Connection, Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import { Program, Wallet, AnchorProvider, Address } from '@coral-xyz/anchor';
import { WbaPrereq, IDL } from './programs/wba_prereq';
import wallet from './wba-wallet.json';

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection(
  'https://rpc-devnet.helius.xyz/?api-key=eb53a054-c1f1-4da9-8882-7497a3862901'
);
const github = Buffer.from('mikejhale', 'utf8');

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: 'confirmed',
});

const program = new Program<WbaPrereq>(
  IDL,
  'HC2oqz2p6DEWfrahenqdq2moUcga9c9biqRBcdK3XKU1' as Address,
  provider
);

const enrollment_seeds = [Buffer.from('prereq'), keypair.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(
  enrollment_seeds,
  program.programId
);

(async () => {
  try {
    const txhash = await program.methods
      .complete(github)
      .accounts({
        signer: keypair.publicKey,
        prereq: enrollment_key,
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
