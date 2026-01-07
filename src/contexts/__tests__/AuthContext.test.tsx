import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import React from 'react';

describe('AuthContext', () => {
  it('provides user as null by default', () => {
    function TestComponent() {
      const { user } = useAuth();
      return <span>{user ? 'Logged in' : 'Logged out'}</span>;
    }
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Logged out')).toBeInTheDocument();
  });
});
