
interface GameState
{
    cash: number;
    bank: number;
    total: number;
    cooldownWork: number;
    cooldownSpice: number;
    cooldownCrime: number;
}

interface GameResults
{
    newState: GameState;
    message: string;
    success: boolean;
}

export function calculateTotal (state: GameState): GameState
{
    const newState: GameState = {...state};
    newState.total = newState.cash + newState.bank;
    
    return newState;
}

export function onCooldown (state: GameState, targetCooldown: number): GameResults | null
{
    const currentTime: number = Date.now();
    if (currentTime >= targetCooldown) return null;

    const timeLeft = Math.ceil( (targetCooldown - currentTime) / 1000);
    
    const failureResults: GameResults = {
        newState: state,
        message: `You are too tired! Wait ${timeLeft} seconds!`,
        success: false
    };

    return failureResults;
}

export function handleWork (state: GameState): GameResults
{
    const newState: GameState = {...state};

    const cooldownError: GameResults | null = onCooldown(state, state.cooldownWork);
    if (cooldownError !== null) return cooldownError;

    const workPrize: number = 50;

    newState.cash += workPrize;
    newState.cooldownWork = Date.now() + 60000;

    const successResults: GameResults = {
        newState: calculateTotal(newState),
        message: `You worked hard and earned ${workPrize}`,
        success: true
    };

    return successResults;
}

export function handleSpice (state: GameState): GameResults
{
    const newState: GameState = {...state};

    const cooldownError: GameResults | null = onCooldown(state, state.cooldownSpice);
    if (cooldownError !== null) return cooldownError;

    const spicePrize: number = Math.floor(Math.random() * (300 - 100 + 1)) + 100;

    newState.cash += spicePrize;
    newState.cooldownSpice = Date.now() + 120000;

    const successResults: GameResults = {
        newState: calculateTotal(newState),
        message: `You spiced hard and earned ${spicePrize}`,
        success: true
    };

    return successResults;
}

export function handleCrime (state: GameState): GameResults
{
    const newState: GameState = {...state};

    const cooldownError: GameResults | null = onCooldown(state, state.cooldownCrime);
    if (cooldownError !== null) return cooldownError;

    const crimeRate: number = Math.floor(Math.random() * (100 + 1));
    const crimeWon: number = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    const crimeSuccess: boolean = crimeRate > 30;
    const crimePrize: number = crimeSuccess ? crimeWon : Math.floor(newState.cash * (-0.2));
    const crimeMessage: string = crimeSuccess ? 'got away with' : 'lost';

    newState.cash += crimePrize;
    newState.cooldownCrime = Date.now() + 240000;

    const successResults: GameResults = {
        newState: calculateTotal(newState),
        message: `You committed a crime and ${crimeMessage} ${Math.abs(crimePrize)}`,
        success: crimeSuccess
    };

    return successResults;
}
