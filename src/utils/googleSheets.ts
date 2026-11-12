export async function sendToGoogleSheets(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim()) return false;

  try {
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    });
    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheets webhook:', error);
    return false;
  }
}
