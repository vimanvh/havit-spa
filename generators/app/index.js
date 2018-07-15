var Generator = require('yeoman-generator');
module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.argument('appname', { type: String, required: true });
	}

	writing() {
		this.fs.copyTpl(
			this.templatePath('main-template/**'),
			this.destinationPath('./' + this.options.appname),
			{ appname: this.options.appname }
		);

		this.fs.copy(
			this.templatePath('template.code-workspace'),
			this.destinationPath(this.options.appname + "/" + this.options.appname + ".code-workspace")
		);
	}
};