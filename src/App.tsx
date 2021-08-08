import React from 'react';
import './App.scss';
import { createTheme, ThemeProvider } from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import Header from './components/Header/Header';
import Body from './components/Body/Body';

export const PathContext = React.createContext('');

function App() {
    const theme = createTheme({
        palette: {
            primary: {
                main: Colors.blue[700],
                dark: Colors.blue[800],
                light: Colors.blue[600],
            },
        },
    });

    let path = window.location.pathname;
    if (path.startsWith('/'))
        path = path.substring(1);

    return (<>
        {/* <head>
            <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width"
            />
        </head> */}
        <ThemeProvider theme={theme}>
            <PathContext.Provider value={path}>
                <Header />
                <Body />
            </PathContext.Provider>
        </ThemeProvider>
    </>);
}

export default App;
