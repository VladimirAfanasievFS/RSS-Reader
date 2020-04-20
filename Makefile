install:
	npm install
build:
	# rm -rf dist
	NODE_ENV=production npx webpack
publish:
	npm publish --dry-run
webpack:
	npx webpack
webpack-watch:
	npx webpack	--watch
webpack-server:	
	npx webpack-dev-server --open
gitlg: 
	git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%C(bold blue)<%an>%Creset' --abbrev-commit"
make lint:
	npx eslint .
make lint-fix:
	npx eslint . --fix
test:
	npm test	
testNow: 
	npx jest --runTestsByPath "__tests__/index.test.js" --watch
test-coverage:
	npm test -- --coverage
.PHONY: test	



