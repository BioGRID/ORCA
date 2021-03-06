import sys, string
import Config
import Database
import MySQLdb
import datetime
import math
import json
import atexit, os, time

from classes import Lookups, MatrixView, RawDataHandler, RawAnnotatedView

class ViewGenerator( ) :

	"""Class for managing the building of views"""

	def __init__( self ) :
		self.db = Database.db
		self.lookups = Lookups.Lookups( self.db )
		self.sgRNAToGroup = { }
		self.sgRNAGroups = self.lookups.buildSGRNAGroupHash( )
		self.sgRNAGroupToGene = self.lookups.buildGroupIDToGeneAnnotation( )
		self.organismHash = self.lookups.buildOrganismHash( )
		self.matrixView = None
		self.rawAnnotatedView = None
		self.rawData = RawDataHandler.RawDataHandler( self.db )
	
	def run( self ) :
		"""Default class to start the generator process executing"""
		self.buildViews( )
	
	def buildViews( self ) :
		"""Entire process for building views that are queued"""
		queuedViews = self.fetchQueuedViews( )
		
		for view in queuedViews :
			if not self.viewExists( view['view_code'] ) :
			
				# Build a set of mappings that are required, if they do not already
				# exist in the mapping table
				mappings = json.loads( view['view_mappings'] )
				for mappingID in mappings :
					if str(mappingID) not in self.sgRNAToGroup and str(mappingID) != "0" :
						self.sgRNAToGroup[str(mappingID)] = self.lookups.buildSGRNAIDtoSGRNAGroupHash( mappingID )
			
				# Build unique set of files we'll need for this view
				# including controls
				fileMap = json.loads( view['view_files'] )
				files = fileMap.keys( )
				controls = set( )
				for fileID,fileInfo in fileMap.iteritems( ) :
					ctrlSet = fileInfo['BG'].split( "|" )
					for ctrl in ctrlSet :
						controls.add( ctrl )

				# Fetch additional file annotation and load
				# all of the raw data into a hash
				allFiles = list(controls) + files
				self.rawData.loadRawData( allFiles )
		
				# View Type 1 is a Matrix View
				viewDetails = { }
				if str(view['view_type_id']) == "1" :
					self.buildMatrixView( view, fileMap, allFiles )
				# View Type 2 is a Annoted Raw Data File
				elif str(view['view_type_id']) == "2" :
					self.buildRawAnnotatedView( view, fileMap, allFiles )
				else :
					# Unknown View Type, Do Nothing, Leave it Queued
					continue
					
			self.updateViewState( view['view_id'], 'complete' )
			
	def buildMatrixView( self, view, fileMap, allFiles ) :
	
		"""Create a matrix view using the appropriate classes"""
		if self.matrixView == None :
			self.matrixView = MatrixView.MatrixView( self.db, self.sgRNAToGroup, self.sgRNAGroups, self.sgRNAGroupToGene, self.organismHash )
		
		fileHash = self.lookups.buildFileHash( allFiles )
		viewDetails = self.matrixView.build( view, fileMap, self.rawData, fileHash )
		self.updateViewDetails( view['view_id'], viewDetails )
		
	def buildRawAnnotatedView( self, view, fileMap, allFiles ) :
	
		"""Create a matrix view using the appropriate classes"""
		if self.rawAnnotatedView == None :
			self.rawAnnotatedView = RawAnnotatedView.RawAnnotatedView( self.db, self.sgRNAToGroup, self.sgRNAGroups, self.sgRNAGroupToGene )
		
		viewDetails = self.rawAnnotatedView.build( view, fileMap, self.rawData )
		self.updateViewDetails( view['view_id'], viewDetails )
			
	def viewExists( self, viewCode ) :
		"""Test to see if a view already exists as a table"""
		try :
			with self.db as cursor :
				cursor.execute( "SELECT * FROM " + Config.DB_VIEWS + ".view_" + viewCode + " LIMIT 1" )
				return True
		except MySQLdb.Error :
			return False
				
	def updateViewState( self, viewID, viewState ) :
		"""Change the state of a given view"""
		with self.db as cursor :
			cursor.execute( "UPDATE " + Config.DB_MAIN + ".views SET view_state=%s WHERE view_id=%s", [viewState, viewID] )
			self.db.commit( )
			
	def updateViewDetails( self, viewID, viewDetails ) :
		"""Change the details of a given view"""
		with self.db as cursor :
			cursor.execute( "UPDATE " + Config.DB_MAIN + ".views SET view_details=%s WHERE view_id=%s", [json.dumps(viewDetails), viewID] )
			self.db.commit( )
		
	def fetchQueuedViews( self ) :
		"""Fetch views from the database that are in need of being built"""
		with self.db as cursor :
			cursor.execute( "SELECT * FROM " + Config.DB_MAIN + ".views WHERE view_state='building' AND view_status='active' ORDER BY view_addeddate ASC" )
			
			queuedViews = []
			for row in cursor.fetchall( ) :
				queuedViews.append( row )
				
			return queuedViews
		