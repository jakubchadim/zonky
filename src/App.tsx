import React from 'react'
import logo from './logo.svg'
import './App.css'
import { fetchAvgLoans } from './zonky'

const App: React.FC = () => {
  const [rating, setRating] = React.useState<string>('')
  const [avgLoans, setAvgLoans] = React.useState<number>(0)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>()

  React.useEffect(() => {
    const controller: AbortController = new AbortController()

    if (rating) {
      setLoading(true)
      setError(undefined)

      fetchAvgLoans(rating, controller.signal)
        .then(setAvgLoans)
        .catch((err) => {
          if (!controller.signal.aborted) {
            setError(err)
          }
        })
        .then(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })
    }

    return () => controller.abort()
  }, [rating])

  return (
    <div className='App'>
      <header className='App-header'>
        <img
          src={logo}
          className={`App-logo ${loading ? 'App-logo--spin' : ''}`}
          alt='logo'
        />
        <p>
          Enter rating
        </p>
        <input
          className='App-input'
          onChange={(e) => setRating(e.target.value)}
          value={rating}
        />
        <h1 className={loading ? 'App-avg--loading' : ''}>
          {avgLoans.toFixed(2)} CZK
        </h1>
        {error ? error.message : ''}
      </header>
    </div>
  )
}

export default App
