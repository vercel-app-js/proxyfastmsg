export default async function handler(req, res) {
  const targetUrl = 'https://api.dkon.app' + req.url; // Сохраняем исходный путь и параметры запроса
  const { method, headers, body } = req;

  // Удаляем заголовки, которые могут раскрыть информацию о Vercel
  delete headers['host'];
  delete headers['connection'];
  delete headers['accept-encoding']; //  Удаляем Accept-Encoding чтобы избежать проблем с gzip/deflate

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual' // Важно для проксирования редиректов
    });

    // Копируем заголовки из ответа и отправляем их клиенту
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Удаляем заголовки, которые могут раскрыть информацию о mysite.ru
    res.removeHeader('server');
    res.removeHeader('x-powered-by');


    // Отправляем тело ответа клиенту
    const responseBody = await response.text(); // Или response.json() если API возвращает JSON
    res.status(response.status).send(responseBody);

  } catch (error) {
    console.error(error);
    res.status(500).send(`Proxy error: ${error.message}`);
  }
}

//  Отключаем парсинг тела запроса, чтобы можно было передавать любые данные
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}
