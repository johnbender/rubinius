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

  ERB.new(nodes).result(binding)
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
  File.join(Pathname.new(File.expand_path('../../../', __FILE__)), "projects", "profiler")
end

def project_file_read(file)
  File.open(File.join(project_root, file)).read
end

def template
  project_file_read("output.html.erb")
end

# NOTE style and js serialized here to avoid dealing with
# pathing issues in the template output
def css
  project_file_read("all.css")
end

def js
  project_file_read("all.js")
end

def nodes
  project_file_read("nodes.html.erb")
end

file = ARGV.shift

unless File.exists? file
  puts "File '#{file}' does not exist"
  exit 1
end

output = ARGV.shift
puts "Rendering profiling from '#{file}' to '#{output}'"
data = JSON.load(File.read(file))
File.open(output, "w").puts(ERB.new(template).result(binding))
