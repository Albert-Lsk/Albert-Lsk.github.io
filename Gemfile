source "https://rubygems.org"

# GitHub Pages官方推荐配置
gem "github-pages", group: :jekyll_plugins

# 必需的Jekyll插件
group :jekyll_plugins do
  gem "jekyll-paginate"
  gem "jekyll-sitemap"
  gem "jekyll-gist"
  gem "jekyll-feed"
  gem "jekyll-include-cache"
end

# Windows和JRuby环境支持
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能优化(可选)
gem "wdm", "~> 0.1", :install_if => Gem.win_platform?

# HTTP服务器(Jekyll 4.0+需要)
gem "webrick", "~> 1.7"