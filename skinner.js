const readline = require("readline");
const fs = require('fs')

let defaultConfig = {
	"host" : "ec2-3-236-151-5.compute-1.amazonaws.com",
	"base_dir" : "/avetti/httpd/htdocs/content/preview/store/",
	"shop" : "",
	"working_dir" : "/assets/themes/blaze_en/css/src"
}

let siteConfig = {
	"host" : "ec2-3-236-151-5.compute-1.amazonaws.com",
	"base_dir" : "/avetti/httpd/htdocs/content/preview/store/",
	"shop" : "20190723594",
	"working_dir" : "/assets/themes/blaze_en/css/src"
}

function Shop(config) {
	this.config = config
}

Shop.prototype.init = function(config) {
	console.log(`Initializing shop for local development`)

}

Shop.prototype.push = function() {
	console.log(`Syncing local -> remote`)
}

Shop.prototype.pull = function() {
	console.log(`Syncing remote -> local`)
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


// let shop = new Shop(siteConfig)

if (process.argv[2] == 'init') {
	generateConfig.init(defaultConfig, (config) => {
		console.log(`--> ${JSON.stringify(config)}`)
		console.log(`creating directory ${process.cwd() + '/' + config.shop}`)
		let working_dir = process.cwd() + '/' + config.shop
		fs.mkdir(working_dir, (error) => {
			if (error) { 
				throw error
			}  
			
			console.log(`Local directory ${config.shop} created`)
			console.log(`Writing config: ${working_dir + '/.config'}`)
			fs.writeFile(working_dir + '/.config', JSON.stringify(config), (error) => {
				if (error) {
					throw(error)
				}
				console.log('Config written to disk')
			}) 
		})
	})
}	
