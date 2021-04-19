const readline = require("readline");
const fs = require('fs')
const Rsync = require('rsync');
const chokidar = require('chokidar');
const sass = require('node-sass');



let defaultConfig = {
	"host" : "ggc8admin3.avetti.ca",
	"base_dir" : "/avetti/httpd/htdocs/content/preview/store/",
	"shop" : "20201202448",
	"working_dir" : "/assets/themes/blaze_en/css"
}

let privKey = ''
let username = ''

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

Shop.prototype.pull = function(callback) {
	

	let source = `geiger_jpaine@${this.config.host}:${this.config.base_dir + this.config.shop + this.config.working_dir}`

	console.log(`pulling ${source} -> ${this.working_dir}`)

	var rsync = new Rsync()
	.shell('ssh -i ~/.ssh/geiger_jpaine_rsa -p 5511')
	.flags('chavzP')
	.source(source)
	.destination(this.working_dir);

	// Execute the command
	rsync.execute(function(error, code, cmd) {
	// we're done
		if (error) {
			ballback(err)
			return
		}

		callback(null)
	});
}

Shop.prototype.watch = function(action) {
	console.log(`watching: ${this.working_dir}/css/src`)

	let watcher = chokidar.watch(`${this.working_dir}/css/src`, {
		persistent: true
	});
		
	watcher
		.on('change', path => {
			action(path)
		//	console.log(`file changed: ${path}`)
		})
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

let compile = function(scss_file, css_file, callback) {
	console.log('Compiling')
	console.log(`input: ${scss_file}`)
	console.log(`output: ${css_file}`)
	sass.render({
	  file: scss_file,
	  outFile: css_file,
	  sourceMap: true,
  	  sourceMapEmbed: true,
	  sourceMapContents: true
	}, function(error, result) { // node-style callback from v3.0.0 onwards
	    if(!error){
	      // No errors during the compilation, write this result on the disk
	      fs.writeFile(css_file, result.css, function(err){
	      	callback(err)
	      });
	      return
	    }
	    callback(error)
	  });
} 


if (process.argv[2] == 'init') {
	new Shop(null, null).init((error, shop) => {
		if (error) throw error

		shop.pull()
		
	})
} else {

	let working_dir = process.cwd() + '/20201202448'
	fs.readFile(`${working_dir}/.config`, (err, data) => {
	    if (err) throw err;
	    let config = JSON.parse(data)
		let s = new Shop(working_dir, config)
		// sync remote -> local
		s.pull(function(err) {
			if (err) {
				console.log(err)
				return
			}
			console.log('done!')
			//watch working directory /css/src for file changes
			s.watch(function(modifiedFile) {
				console.log(`modified: ${modifiedFile}`)
				// compile scss -> css
				compile(`${working_dir}/css/src/v1.scss`, `${working_dir}/css/v1.css`, function(err) {
					if (err) {
						console.log(err)
						console.log('Please correct the above issue, and re-save')
						return
					}
					console.log('compiled!') 
					// sync local -> remote
				})
			}); 

		})
		
	})
}










