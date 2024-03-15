import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Password Manager',
    short_name: 'Pwd Man',
    description: 'Web based password manager',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/next.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ],
  }
}
