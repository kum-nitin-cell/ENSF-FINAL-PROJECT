import '@testing-library/jest-dom';

// Mock window.confirm for delete tests
window.confirm = () => true;

// Mock window.alert
window.alert = () => {};
