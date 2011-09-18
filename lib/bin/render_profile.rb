require 'rubygems'
require 'json'
require 'erb'
require 'pathname'

def print_node(id, data, depth=0)
  output = ""
  node = data["nodes"][id.to_s]

  unless node
    puts "Missing node: #{id}"
    return
  end

  prec = "%.2f" % [100.0 * (node["total"].to_f / data["runtime"].to_f)]

  meth = data["methods"][node["method"].to_s]
  name = "<a href=\"txmt://open?url=file://#{meth['file']}&line=#{meth['line']}\">#{meth['name']}</a> (#{node['called']}/#{meth['called']})"

  if prec.to_f <= 1.0
    color = "S"
  else
    color = prec.to_i / 10
  end

  child = node['sub_nodes'].map { |x| data['nodes'][x.to_s] }.inject(0) { |a,n| a + n['total'] }
  s = node['total'] - child

  self_prec = "%.2f" % [100.0 * (s / data['runtime'].to_f)]

  template = File.join(project_root, "projects", "profiler", "nodes.html.erb")
  ERB.new(File.open(template).read).result(binding)
end

def sub_nodes(node, data)
  node["sub_nodes"].sort_by do |s|
    if n = data["nodes"][s.to_s]
      n["total"].to_f / data["runtime"]
    else
      0
    end
  end
end

def project_root
  Pathname.new(File.expand_path('../../../', __FILE__))
end

file = ARGV.shift

unless File.exists? file
  puts "File '#{file}' does not exist"
  exit 1
end

output = ARGV.shift

puts "Rendering profiling from '#{file}' to '#{output}'"

data = JSON.load(File.read(file))

template = File.join(project_root, "projects", "profiler", "output.html.erb")
template = File.join(project_root, "projects", "profiler", "output.html.erb")
File.open(output, "w").puts(ERB.new(File.open(template).read).result(binding))
