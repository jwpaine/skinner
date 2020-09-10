const readline = require("readline");
const fs = require('fs')
const Rsync = require('rsync');



let defaultConfig = {
	"host" : "ubuntu@ec2-3-236-151-5.compute-1.amazonaws.com",
	"base_dir" : "/avetti/httpd/htdocs/content/preview/store/",
	"shop" : "20190723594",
	"working_dir" : "/assets/themes/blaze_en/css"
}

let siteConfig = {
	"host" : "ec2-3-236-151-5.compute-1.amazonaws.com",
	"base_dir" : "/avetti/httpd/htdocs/content/preview/store/",
	"shop" : "20190723594",
	"working_dir" : "/assets/themes/blaze_en/css"
}

function Shop(working_dir, config) {
	 this.working_dir = working_dir
	 this.config = config
}

Shop.prototype.init = function(callback) {
	console.log(`Initializing shop for local development`)
	generateConfig.init(defaultConfig, (config) => {
		// preserve supplied config and working_dir values
		this.config = config
		this.working_dir = process.cwd() + '/' + config.shop

		console.log(`--> ${JSON.stringify(this.config)}`)
		console.log(`creating directory ${process.cwd() + '/' + this.config.shop}`)

		fs.mkdir(this.working_dir, (error) => {
			if (error) { 
				throw error
			}  	
			console.log(`Local directory ${this.config.shop} created`)
			console.log(`Writing config: ${this.working_dir + '/.config'}`)
			fs.writeFile(this.working_dir + '/.config', JSON.stringify(this.config), (error) => {
				callback(error, this)
			}) 
		})
	})
}

Shop.prototype.push = function() {
	console.log(`Syncing local -> remote`)
}

Shop.prototype.pull = function() {
	

	let source = `${this.config.host}:${this.config.base_dir + this.config.shop + this.config.working_dir}`

	console.log(`pulling ${source} -> ${this.working_dir}`)


	var rsync = new Rsync()
	.shell('ssh')
	.flags('az')
	.source(source)
	.destination(this.working_dir);

	// Execute the command
	rsync.execute(function(error, code, cmd) {
	// we're done
		if (error) {
			console.log(error)
		}
		console.log('done!')
	});
}

Shop.prototype.watch = function(local_dir, action) {

}

let generateConfig = {}

generateConfig.init = function(defaultConfig, callback) {

	const _interface = readline.createInterface({
    	input: process.stdin,
    	output: process.stdout
	});
	
	let config = {}
	let keys = Object.keys(defaultConfig)
	let i = 0;
	
	generateConfig.getUserInput = function(){
		
		let prompt = `Supply ${keys[i]} or enter for default [${defaultConfig[keys[i]]}]: `
		if (defaultConfig[keys[i]] == "") {
			prompt = `Supply ${keys[i]}: `
		}
		_interface.question(prompt, (value) => {
			if (value == "") {
				config[keys[i]] = defaultConfig[keys[i]] 
			} else {
				config[keys[i]] = value
			}
			i++;
      		if(i < keys.length){
        		generateConfig.getUserInput();
      		} else {
        		console.log(`done`);
				_interface.close()
				callback(config)
      		}
    	});
   	};
   generateConfig.getUserInput();	
}


if (process.argv[2] == 'init') {
	new Shop(null, null).init((error, shop) => {
		if (error) throw error

		shop.pull()
		
	})
}

// test pull
let working_dir = process.cwd() + '/' + defaultConfig.shop
test = new Shop(working_dir, defaultConfig)
test.pull()


