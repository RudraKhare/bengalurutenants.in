declare global {
  interface Window {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<any>;
      };
    };
  }
}
