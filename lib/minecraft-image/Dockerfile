# Use an official runtime as a parent image. (from AWS ECR Public gallery, i.e. https://gallery.ecr.aws/ )
FROM public.ecr.aws/docker/library/alpine:3.18.0

# Set the working directory to /minecraft
WORKDIR /minecraft

# Copy the license configuration files to the '/minecraft/' directory. 
# These will be needed for the Minecraft server to run properly.
COPY eula.txt /minecraft/

COPY server.properties /minecraft/ 

RUN apk add --no-cache openjdk17

RUN apk add --no-cache curl

# Download the Java based version of Minecraft.
RUN curl -o minecraft_server.jar https://piston-data.mojang.com/v1/objects/8dd1a28015f51b1803213892b50b7b4fc76e594d/server.jar

# Run initial commands when the container launches to start the Minecraft server.
CMD ["java", "-Xmx1024m", "-Xms1024m", "-jar", "minecraft_server.jar", "nogui"]