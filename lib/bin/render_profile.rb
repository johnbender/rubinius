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

  if node["sub_nodes"].empty?
    output += %Q!<li class="color#{color}" style="display:block"><img src="http://asset.rubini.us/empty.png"> #{prec}% (#{self_prec}%) #{name}!
  else
    if depth > 20
      output += %Q!<li class="color#{color}" style="display:block"><img class="toggle" src="http://asset.rubini.us/plus.png"> #{prec}% (#{self_prec}%) #{name}!
      output += "<ul style=\"display:none\">"
    else
      output += %Q!<li class="color#{color}" style="display:block"><img class="toggle" src="http://asset.rubini.us/minus.png"> #{prec}% (#{self_prec}%) #{name}!
      output += "<ul>"
    end

    subs = node["sub_nodes"].sort_by do |s|
      if n = data["nodes"][s.to_s]
        n["total"].to_f / data["runtime"]
      else
        0
      end
    end

    subs.reverse_each do |s_id|
      output += print_node(s_id, data, depth + 1)
    end

    output += "</ul>"
  end

  output += "</li>"
end

file = ARGV.shift

unless File.exists? file
  puts "File '#{file}' does not exist"
  exit 1
end

output = ARGV.shift

puts "Rendering profiling from '#{file}' to '#{output}'"

data = JSON.load(File.read(file))
project_root = Pathname.new(File.expand_path('../../../', __FILE__))
template = File.join(project_root, "projects", "profiler", "output.html.erb")

File.open(output, "w").puts(ERB.new(File.open(template).read).result(binding))
