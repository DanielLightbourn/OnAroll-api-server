#!usr/bin/env python3
# Title: readCourses
# Author: Cerras0981
# Date: 6-27-2017
# Desc: This script reads a csv file containing all classes
# that are taking place in a semester then converts them into
# a format our database understands. Then, it inserts all
# of the data automatically.
#
#
# NOTE: This script uses triple spaces for tabbing.

# Imports
import sys;


# System vars
DATABASE = "OnARoll_MarkI";
USER = "server";
PASS = "Server_123";


# Handle sys.argv
if(len(sys.argv) != 2):
   print("Invalid number of arguments!\n1 supported", len(sys.argv)-1, "provided\n");
   exit(1);
else:
   fileIn = sys.argv[1];

print("Reading file:", fileIn);


