const canvasPath = (name, operation) => (
  `/api/v1/rust/canvas/${encodeURIComponent(name)}/${operation}`
);

const requireSuccess = async (response, operation) => {
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}`);
  }
  return response;
};

export const initializeCanvas = async (name, width, height) => {
  const response = await fetch(canvasPath(name, 'init'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ width, height }),
  });
  await requireSuccess(response, 'Canvas initialization');
};

export const getCanvasInfo = async (name) => {
  const response = await fetch(canvasPath(name, 'info'));
  await requireSuccess(response, 'Canvas metadata request');
  return response.json();
};

export const getCanvasData = async (name) => {
  const response = await fetch(canvasPath(name, 'data'));
  await requireSuccess(response, 'Canvas data request');
  return new Uint8Array(await response.arrayBuffer());
};

export const getCanvasWebSocketPath = (name) => canvasPath(name, 'ws');
