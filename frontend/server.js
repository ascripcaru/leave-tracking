const express = require('express');
const compression = require('compression');
const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN;

function ensureDomain(req, res, next) {
  if (!domain || req.hostname === domain) {
    // OK, continue
    return next();
  };

  // handle port numbers if you need non defaults
  res.redirect(`http://${domain}${req.url}`);
};

const app = express();

// at top of routing calls
app.all('*', ensureDomain);

app.use(compression());

app.use(express.static('./', { extensions: ['html'] }))

app.listen(port, () => {
  console.log('Server running ... on port', port);
});
