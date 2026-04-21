import styles from '@/styles/checker.module.scss';
import bundle from '@/bundles/barrel_checker';
import whitelist from "@/data/whitelistedUsers.json";
import { useState } from 'react';
import 
{ 
    merkleValidator, 
    MerkleResults, 
    extractErrorMessage 
} from '@/utilities/contract';

export default function Checker(): React.ReactElement
{
    const [address, setAddress] = useState<string>('');
    const [whitelisted, setWhitelisted] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleChange (event: React.ChangeEvent<HTMLInputElement>): void
    {
        setAddress(event.target.value.trim().toLowerCase());
    }

    async function handleSubmit (event: React.FormEvent<HTMLFormElement>): Promise<void>
    {
        
        try
        {
            setError(null);
            setWhitelisted(null);

            event.preventDefault();

            const wrongStart: boolean = !address.startsWith('0x');
            const wrongLength: boolean = address.length !== 42;
            const invalidInput: boolean = wrongStart || wrongLength;
            const merkle: MerkleResults = merkleValidator(address, whitelist.addresses);

            if (!address) throw new Error ('PLEASE PROVIDE A WALLET ADDRESS FIRST');
            if (invalidInput) throw new Error ('PLEASE ENTER A VALID WALLET ADDRESS');
            
            setWhitelisted((merkle.proof.length > 0));
        } catch (error: any)
        {
            setWhitelisted(null);
            setError(extractErrorMessage(error));
        }
    }

    function whitelistStatus(): React.ReactElement
    {
        if (error) return <p style={{ color: '#C9A227' }}>{error}</p>
        if (whitelisted === null) return <></>

        const invalid: string = 'WALLET ADDRESS IS NOT WHITELISTED';
        const valid: string = 'WALLET ADDRESS IS WHITELISTED';
        const status: string = !whitelisted ? invalid : valid

        return <p style={{ color: !whitelisted ? 'red' : 'green' }}>{status}</p>
    }

    return (

        <main id='checker' className={styles.checkerContainer}>

            <section id='inputField' className={styles.inputField}>
            
                <form onSubmit={handleSubmit}>

                    <label htmlFor='address'>ENTER YOUR WALLET ADDRESS</label>

                    <input 
                        type='text'
                        id='address'
                        value={address}
                        onChange={handleChange}
                    />

                    <button type='submit'>CHECK</button>

                    {
                        whitelistStatus()
                    }
                </form>
        
            </section>
        
        </main>

    )
}