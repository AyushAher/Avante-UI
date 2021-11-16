var shell = require('shelljs');

var package = require('./package');

var files = ['header.DistJs', 'defaults.DistJs', 'utils.DistJs', 'simpledraw.DistJs', 'rangemap.DistJs', 'interact.DistJs', 'base.DistJs', 'chart-line.DistJs', 'chart-bar.DistJs', 'chart-tristate.DistJs', 'chart-discrete.DistJs', 'chart-bullet.DistJs', 'chart-pie.DistJs', 'chart-box.DistJs', 'vcanvas-base.DistJs', 'vcanvas-canvas.DistJs', 'vcanvas-vml.DistJs', 'footer.DistJs'];

shell.cd('src');

var src = shell.cat(files).replace(/@VERSION@/mg, package.version);

shell.cd('..');

src.to('jquery.sparkline.DistJs');
