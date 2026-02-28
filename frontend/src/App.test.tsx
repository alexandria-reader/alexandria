import { Provider } from 'jotai';
import App from './App';

xtest('renders learn react link', () => {
  <Provider>
    render(
    <App />
    ); const linkElement = screen.getByText(/Learn by reading/i);
    expect(linkElement).toBeInTheDocument();
  </Provider>;
});
