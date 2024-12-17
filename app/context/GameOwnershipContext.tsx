import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface GameOwnershipState {
  ownedGames: Set<number>;
}

type Action = { type: 'TOGGLE_OWNERSHIP'; gameId: number };

const initialState: GameOwnershipState = {
  ownedGames: new Set(),
};

function gameOwnershipReducer(state: GameOwnershipState, action: Action): GameOwnershipState {
  switch (action.type) {
    case 'TOGGLE_OWNERSHIP':
      const newOwnedGames = new Set(state.ownedGames);
      if (newOwnedGames.has(action.gameId)) {
        newOwnedGames.delete(action.gameId);
      } else {
        newOwnedGames.add(action.gameId);
      }
      return { ...state, ownedGames: newOwnedGames };
    default:
      return state;
  }
}

const GameOwnershipContext = createContext<{
  state: GameOwnershipState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GameOwnershipProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameOwnershipReducer, initialState);
  return (
    <GameOwnershipContext.Provider value={{ state, dispatch }}>
      {children}
    </GameOwnershipContext.Provider>
  );
};

export const useGameOwnership = () => useContext(GameOwnershipContext); 