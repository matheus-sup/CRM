'use server'

export async function testAction() {
  return {
    success: true,
    message: 'Server action funcionando!',
    timestamp: new Date().toISOString()
  }
}
