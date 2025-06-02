import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
const Login = () => {
    const [email, setEmail] = useState('chamseddinebz@gmail.com')
    const [password, setPassword] = useState('chamseddinebz@gmail.com')
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [generalError, setGeneralError] = useState('')
    
    const validationSchema = z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    })

 

    const handleLogin = async () => {
        const result = validationSchema.safeParse({ email, password });

        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                email: formatted.email?._errors[0],
                password: formatted.password?._errors[0],
            });
            return;
        }
        setErrors({});
        setGeneralError('');
        try{
            const response = await fetch('http://localhost:8000/api/login', {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body:JSON.stringify({email,password})
            })
            if(!response.ok){
                if(response.status === 401){
                    setGeneralError('Invalid email or password');
                } 
                throw new Error(`HTTP error! status: ${response.status}`);
           }
            const data = await response.json()
            await AsyncStorage.setItem('access_token', data.access_token);
           
            } catch (error) {
                if (error instanceof Error) {


                    if (error.message.includes('422')) {
                        setGeneralError('Invalid email or password');
                    } else {
                        setGeneralError('An error occurred during login. Please try again.');
                    }
                } else {
                    setGeneralError('An error occurred during login. Please try again.');
                }
            }
    }

    return (
        <SafeAreaView>
            <View>
                <Text>Login</Text>
                {generalError && <Text style={styles.errorText}>{generalError}</Text>}
                <TextInput 
                    placeholder='Email' 
                    style={styles.input} 
                    onChangeText={setEmail} 
                    value={email} 
                />
                <TextInput
                    placeholder='Password'
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true} 
                />
                {errors?.email && <Text style={styles.errorText}>{errors.email}</Text>}
                {errors?.password && <Text style={styles.errorText}>{errors.password}</Text>}
                <Button title='Login' onPress={handleLogin} />
            </View>
        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        margin: 10
    },
    errorText: {
        color: 'red',
        marginLeft: 10
    }
})