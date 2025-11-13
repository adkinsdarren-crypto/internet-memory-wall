export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#faf5ff'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Internet Memory Wall
      </h1>
      <p style={{ fontSize: '1.1rem', maxWidth: '40rem' }}>
        This is my first custom Next.js page. Soon this will become a place
        where people can claim tiles and share their favourite memories from
        around the internet.
      </p>
    </main>
  )
}