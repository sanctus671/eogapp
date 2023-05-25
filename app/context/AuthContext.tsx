import {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import environment from "../constants/environment";

interface AuthProps {
	authState?: { token: string | null; authenticated: boolean | null, ready: boolean | null};
	onRegister?: (name:string, email: string, password: string) => Promise<any>;
	onRegisterAnonymous?: () => Promise<any>;
	onLogin?: (email: string, password: string) => Promise<any>;
	onResetPassword?: (email: string) => Promise<any>;
	onLogout?: () => Promise<any>;
}


const TOKEN_KEY = 'eog_token';
const API_URL = environment.API_URL;
const AuthContext = createContext<AuthProps>({});


export const useAuth = () => {
	return useContext(AuthContext);
}

export const AuthProvider = ({children}:any) => {

	const [authState, setAuthState] = useState<{
		token: string | null;
		authenticated:boolean | null;
		ready:boolean | null;
	}>({
	token: null,
	authenticated: null,
	ready: null
	});
	
	
	useEffect(() => {
		const loadToken = async () => {
			try{

				const token = await SecureStore.getItemAsync(TOKEN_KEY);
				console.log("stored:", token);
				
				if (token){
				
					axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
				
					setAuthState(
						{
							token: token,
							authenticated: true,
							ready:true
						}
					);
				
				}

			}
			finally{
				console.log("here");
				setAuthState(
					{
						token: null,
						authenticated: null,
						ready:true
					}
				);
			}
		}
		loadToken();
		
	}, []	)

	const storeToken = async (token:string) => {
		setAuthState(
			{
				token: token,
				authenticated: true,
				ready:true
			}
		);
		
		
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		
		
		await SecureStore.setItemAsync(TOKEN_KEY, token);		
	}


	const login = async (email:string, password: string) => {
		
		try {
			const result =  await axios.post(`${API_URL}/login`, {email, password});
			
			console.log(result);

			storeToken(result.data.authorisation.token);
			
			return result;
			
			
			
		} catch(e) {
			console.log(e);
			return {error: true, msg: (e as any).message };
		}
		
	
	};


	const resetPassword = async (email:string) => {
		
		try {
			return await axios.post(`${API_URL}/recovery`, {email});
		
		} catch(e) {
			return {error: true, msg: (e as any).message };
		}
		
	
	};


	
	
	const register = async (name:string, email:string, password: string) => {
		
		try {
			const result = await axios.post(`${API_URL}/register`, {email, password});

			storeToken(result.data.authorisation.token);

			return result;

		
		} catch(e) {
			return {error: true, msg: (e as any).message };
		}
		
	
	};

	
	const registerAnonymous = async () => {
		
		try {
			const result = await axios.post(`${API_URL}/registeranonymous`, {});

			storeToken(result.data.authorisation.token);

			return result;
		
		} catch(e) {
			return {error: true, msg: (e as any).message };
		}
		
	
	};

	
	const logout = async () => {

		axios.defaults.headers.common['Authorization'] = '';
		
		setAuthState({
			token:null,
			authenticated:false,
			ready:true
		
		});


		await SecureStore.deleteItemAsync(TOKEN_KEY);
		

		
	}
	

	const value = {
		onRegister: register,
		onRegisterAnonymous: registerAnonymous,
		onLogin: login,
		onLogout: logout,
		onResetPassword: resetPassword,
		authState
	
	};
	
	
	
	
	
	
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
	
	
	
}