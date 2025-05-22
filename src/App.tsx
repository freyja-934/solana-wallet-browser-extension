import { createTheme, MantineColorsTuple, MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Unlock from './pages/Unlock';
import { store } from './store/store';

const primaryColor: MantineColorsTuple = [
  '#f1e9ff',
  '#dccfff',
  '#b59bff',
  '#8c64ff',
  '#6a36fe',
  '#5419fe',
  '#4200ff',
  '#3a00e4',
  '#3200cc',
  '#2800b4'
];

const theme = createTheme({
  colors: {
    primary: primaryColor,
  },
  primaryColor: 'violet',
  components: {
    Button: {
      defaultProps: {
        radius: "xl"
      }
    }
  }
});

function App() {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme='dark'>
        <Router>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MantineProvider>
    </Provider>
  );
}

export default App;
