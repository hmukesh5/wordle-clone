import './App.css'
import Wordle from './components/Wordle'
import { Toaster } from 'react-hot-toast'

function App() {
    return (
        <div className="App">
            <Wordle />
            <Toaster
                position="top-center"
                reverseOrder={false}
                containerStyle={{
                    marginTop: 50,                    
                }}
                toastOptions={{
                    duration: 1500,
                    style: {                        
                        textTransform: "lowercase",                                                              
                    },                
                }}
            />
        </div>
    );
}

export default App