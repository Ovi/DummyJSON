const extractClientInfo = req => {
  const { ip: rawIp = '', headers = {} } = req;
  const userAgent = headers['user-agent'] || '';

  const ip = rawIp.startsWith('::ffff:') ? rawIp.substring(7) : rawIp;

  return {
    ip,
    userAgent,
  };
};

export default extractClientInfo;
