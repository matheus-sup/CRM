'use client'

import { useState } from 'react'
import { testAction } from './action'

export default function TestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleTest() {
    setLoading(true)
    try {
      const res = await testAction()
      setResult(JSON.stringify(res))
    } catch (e: any) {
      setResult('ERRO: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Teste de Server Action</h1>
      <button
        onClick={handleTest}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: 16 }}
      >
        {loading ? 'Carregando...' : 'Testar Server Action'}
      </button>
      <pre style={{ marginTop: 20, background: '#f0f0f0', padding: 20 }}>
        {result || 'Clique no botão para testar'}
      </pre>
    </div>
  )
}
