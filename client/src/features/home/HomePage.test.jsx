import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Deep mock the AnimatedGridBackground to prevent ESM crashes from framer-motion and lucide-react
jest.mock('../../components/ui/AnimatedGridBackground', () => {
    return function DummyGrid() {
        return <div data-testid="grid-bg"></div>;
    };
});

describe('HomePage Component', () => {
    it('renders the core marketing text correctly', () => {
        // Need to wrap in BrowserRouter since HomePage likely uses <Link> or useNavigate
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        
        // Assert that the page renders without crashing and shows expected text
        expect(screen.getByText(/A high-performance cloud IDE/i)).toBeInTheDocument();
    });
});
