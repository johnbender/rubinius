class TypesGenerator

  def self.generate
    # Type maps that maps different C types to the C type representations we use
    type_map = {
      "char" => :char,
      "signed char" => :char,
      "__signed char" => :char,
      "unsigned char" => :uchar,
      "short" => :short,
      "signed short" => :short,
      "signed short int" => :short,
      "unsigned short" => :ushort,
      "unsigned short int" => :ushort,
      "int" => :int,
      "signed int" => :int,
      "unsigned int" => :uint,
      "long" => :long,
      "long int" => :long,
      "signed long" => :long,
      "signed long int" => :long,
      "unsigned long" => :ulong,
      "unsigned long int" => :ulong,
      "long unsigned int" => :ulong,
      "long long" => :long_long,
      "long long int" => :long_long,
      "signed long long" => :long_long,
      "signed long long int" => :long_long,
      "unsigned long long" => :ulong_long,
      "unsigned long long int" => :ulong_long,
      "char *" => :string,
      "void *" => :pointer
    }
    
    typedefs = `echo "#include <sys/types.h>\n#include <sys/socket.h>\n#include <sys/resource.h>" | cpp -D_DARWIN_USE_64_BIT_INODE -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64`
    code = ""
    typedefs.each do |type|
      # We only care about single line typedef
      next unless type =~ /typedef/
      # Ignore unions or structs
      next if type =~ /union|struct/
      
      # strip off the starting typedef and ending ;
      type.gsub!(/^(.*typedef\s*)/, "")
      type.gsub!(/\s*;\s*$/,"")
  
      parts = type.split(/\s+/)
      def_type   = parts.join(" ")
      # GCC does mapping with __attribute__ stuf, also see 
      # http://hal.cs.berkeley.edu/cil/cil016.html section 16.2.7. 
      # Problem with this is that the __attribute__ stuff can either
      # occur before or after the new type that is defined...
      if type =~ /__attribute__/
        if parts.last =~ /__QI__|__HI__|__SI__|__DI__|__word__/
          # In this case, the new type is BEFORE __attribute__
          # we need to find the final_type as the type before the
          # part that starts with __attribute__
          final_type = ""
          parts.each do |p|
            break if p =~ /__attribute__/
            final_type = p
          end
        else
          final_type = parts.pop
        end
        
        def_type = "int"
        if type =~ /__QI__/
          def_type = "char"
        elsif type =~ /__HI__/
          def_type = "short"
        elsif type =~ /__SI__/
          def_type = "int"
        elsif type =~ /__DI__/
          def_type = "long long"
        elsif type =~ /__word__/
          def_type = "long"
        end
        def_type = "unsigned #{def_type}" if type =~ /unsigned/
      else
        final_type = parts.pop
        def_type   = parts.join(" ")
      end
      
      if type = type_map[def_type]
        code << "rbx.platform.typedef.#{final_type} = #{type}\n"
        type_map[final_type] = type_map[def_type]
      else
        # Fallback to an ordinary pointer if we don't know the type
        if def_type =~ /\*/
          code << "rbx.platform.typedef.#{final_type} = pointer\n"
          type_map[final_type] = :pointer
        end
      end
    end
    code
  end
end

