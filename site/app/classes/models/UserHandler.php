<?php

namespace ORCA\app\classes\models;

/**
 * User Handler
 * This class is for handling processing of users
 */

use \PDO;
use ORCA\app\lib;
 
class UserHandler {

	private $db;

	public function __construct( ) {
		$this->db = new PDO( DB_CONNECT, DB_USER, DB_PASS );
		$this->db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	}
	
	/**
	 * Build a list of all user ids, user names, emails, and first and last names, last login, class, status
	 */
	 
	public function fetchUserClasses( ) {
		
		$userClasses = array( "observer" );
		
		if( lib\Session::validateCredentials( "admin" ) ) {
			$userClasses[] = "curator";
			$userClasses[] = "poweruser";
			$userClasses[] = "admin";
		} else if( lib\Session::validateCredentials( "poweruser" ) ) {
			$userClasses[] = "curator";
			$userClasses[] = "poweruser";
		} else if( lib\Session::validateCredentials( "admin" ) ) {
			$userClasses[] = "curator";
		}
		
		return $userClasses;
		
	}
	
	/**
	 * Build a list of all user ids, user names, emails, and first and last names, last login, class, status
	 */
	 
	public function buildUserList( ) {
		
		$users = array( );
		
		$stmt = $this->db->prepare( "SELECT user_id, user_name, user_firstname, user_lastname, user_email, user_lastlogin, user_class, user_status FROM " . DB_MAIN . ".users ORDER BY user_firstname ASC" );
		$stmt->execute( );
		
		while( $row = $stmt->fetch( PDO::FETCH_OBJ ) ) {
			$users[$row->user_id] = $row;
		}
		
		return $users;
	}
	
	/**
	 * Build a set of column header definitions for the manage users table
	 */
	 
	public function fetchManageUsersColumnDefinitions( ) {
		
		$columns = array( );
		$columns[0] = array( "title" => "ID", "data" => 0, "orderable" => true, "sortable" => true, "className" => "text-center", "dbCol" => 'user_id' );
		$columns[1] = array( "title" => "Name", "data" => 1, "orderable" => true, "sortable" => true, "className" => "", "dbCol" => 'user_name' );
		$columns[2] = array( "title" => "First Name", "data" => 2, "orderable" => true, "sortable" => true, "className" => "", "dbCol" => 'user_firstname' );
		$columns[3] = array( "title" => "Last Name", "data" => 3, "orderable" => true, "sortable" => true, "className" => "", "dbCol" => 'user_lastname' );
		$columns[4] = array( "title" => "Email", "data" => 4, "orderable" => true, "sortable" => true, "className" => "", "dbCol" => 'user_email' );
		$columns[5] = array( "title" => "Last Login", "data" => 5, "orderable" => true, "sortable" => true, "className" => "", "dbCol" => 'user_lastlogin' );
		$columns[6] = array( "title" => "Class", "data" => 6, "orderable" => true, "sortable" => true, "className" => "text-center userClass", "dbCol" => 'user_class' );
		$columns[7] = array( "title" => "Status", "data" => 7, "orderable" => true, "sortable" => true, "className" => "text-center userStatus", "dbCol" => 'user_status' );
		$columns[8] = array( "title" => "Options", "data" => 8, "orderable" => false, "sortable" => false, "className" => "text-center", "dbCol" => '' );
		
		return $columns;
		
	}
	
	/**
	 * Build a set of user data based on passed in parameters for searching
	 * and sorting of the results returned
	 */
	 
	public function buildCustomizedUserList( $params ) {
		
		$columnSet = $this->fetchManageUsersColumnDefinitions( );
		
		$users = array( );
		
		$query = "SELECT user_id, user_name, user_firstname, user_lastname, user_email, user_lastlogin, user_class, user_status FROM " . DB_MAIN . ".users";
		$options = array( );
		
		if( isset( $params['search'] ) && strlen($params['search']['value']) > 0 ) {
			$query .= " WHERE user_id=? OR user_name LIKE ? OR user_firstname LIKE ? OR user_lastname LIKE ? OR user_email LIKE ? OR user_lastlogin=? OR user_class=? OR user_status=?";
			array_push( $options, $params['search']['value'], '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', $params['search']['value'], $params['search']['value'], $params['search']['value'] );
		}
		
		if( isset( $params['order'] ) && sizeof( $params['order'] ) > 0 ) {
			$query .= " ORDER BY ";
			$orderByEntries = array( );
			foreach( $params['order'] as $orderIndex => $orderInfo ) {
				$orderByEntries[] = $columnSet[$orderInfo['column']]['dbCol'] . " " . $orderInfo['dir'];
			}
			
			$query .= implode( ",", $orderByEntries );
		}
		
		$query .= " LIMIT " . $params['start'] . "," . $params['length'];
		
		$stmt = $this->db->prepare( $query );
		$stmt->execute( $options );
		
		while( $row = $stmt->fetch( PDO::FETCH_OBJ ) ) {
			$users[$row->user_id] = $row;
		}
		
		return $users;
		
	}
	
	/**
	 * Build a count of user data based on passed in parameters for searching
	 * and sorting of the results returned
	 */
	 
	public function getUnfilteredUsersCount( $params ) {
		
		$users = array( );
		
		$query = "SELECT count(*) as rowCount FROM " . DB_MAIN . ".users";
		$options = array( );
		
		if( isset( $params['search'] ) && strlen($params['search']['value']) > 0 ) {
			$query .= " WHERE user_id=? OR user_name LIKE ? OR user_firstname LIKE ? OR user_lastname LIKE ? OR user_email LIKE ? OR user_lastlogin=? OR user_class=? OR user_status=?";
			array_push( $options, $params['search']['value'], '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', '%' . $params['search']['value'] . '%', $params['search']['value'], $params['search']['value'], $params['search']['value'] );
		}
		
		$stmt = $this->db->prepare( $query );
		$stmt->execute( $options );
		
		$row = $stmt->fetch( PDO::FETCH_OBJ );
		
		return $row->rowCount;
		
	}
	
	/**
	 * Build out the options for the User Manager Table Field
	 */
	 
	private function buildUserManagerOptions( $userInfo ) {
		
		$options = array( );

		$options[] = '<i class="optionIcon fa fa-arrow-up fa-lg popoverData classChange text-info" data-userid="' . $userInfo->user_id . '" title="Promote this Account" data-content="Click this to Increase user\'s access level" data-direction="promote"></i>';
		$options[] = '<i class="optionIcon fa fa-arrow-down fa-lg popoverData classChange text-primary" data-userid="' . $userInfo->user_id . '" title="Demote this Account" data-content="Click this to Decrease user\'s access level" data-direction="demote"></i>';
		
		if( $userInfo->user_status == "active" ) {
			$options[] = '<i class="optionIcon fa fa-times fa-lg popoverData text-danger statusChange" data-userid="' . $userInfo->user_id . '" title="Disable this Account" data-content="Click this to disable user\'s access to the ' . CONFIG['WEB']['WEB_NAME_ABBR'] . ' Website" data-status="inactive"></i>';
		} else {
			$options[] = '<i class="optionIcon fa fa-check fa-lg popoverData text-success statusChange" data-userid="' . $userInfo->user_id . '" title="Enable this Account" data-content="Click this to disable user\'s access to the ' . CONFIG['WEB']['WEB_NAME_ABBR'] . ' Website" data-status="active"></i>';
		}
		
		return implode( " ", $options );
		
	}
	
	/**
	 * Build a set of rows for the user manager
	 */
	 
	public function buildManageUserRows( $params ) {
		
		$userList = $this->buildCustomizedUserList( $params );
		$rows = array( );
		foreach( $userList as $userID => $userInfo ) {
			$column = array( );
			$column[] = $userID;
			$column[] = $userInfo->user_name;
			$column[] = $userInfo->user_firstname;
			$column[] = $userInfo->user_lastname;
			$column[] = $userInfo->user_email;
			$column[] = $userInfo->user_lastlogin;
			$column[] = $userInfo->user_class;
			$column[] = $userInfo->user_status;
			$column[] = $this->buildUserManagerOptions( $userInfo );
			$rows[] = $column;
		}
		
		return $rows;
		
	}
	
	/**
	 * Create a new permission group
	 */
	 
	public function addGroup( $groupName, $groupMembers ) {
		
		$stmt = $this->db->prepare( "SELECT group_id FROM " . DB_MAIN . ".groups WHERE group_name=? AND group_status='active' LIMIT 1" );
		$stmt->execute( array( $groupName ));
		
		if( $stmt->rowCount( ) > 0 ) {
			return false;
		}
		
		$row = $stmt->fetch( PDO::FETCH_OBJ );
		
		if( lib\Session::validateCredentials( lib\Session::getPermission( 'MANAGE GROUPS' ))) {
			$stmt = $this->db->prepare( "INSERT INTO " . DB_MAIN . ".groups VALUES( '0', ?, NOW( ), 'active' )" );
			$stmt->execute( array( $groupName ));
			
			// Fetch its new ID
			$groupID = $this->db->lastInsertId( );
			$this->updateGroupUsers( $groupID, $groupMembers );
			
			return true;
		}
	
		return false;
	}
	
	/**
	 * Update the users associated with a specific
	 * permission group
	 */
	 
	public function updateGroupUsers( $groupID, $groupMembers ) {
		
		$stmt = $this->db->prepare( "UPDATE " . DB_MAIN . ".group_users SET group_user_status='inactive' WHERE group_id=?" );
		$stmt->execute( array( $groupID ));
		
		foreach( $groupMembers as $userID ) {
			$stmt = $this->db->prepare( "SELECT group_user_id FROM " . DB_MAIN . ".group_users WHERE user_id=? AND group_id=? LIMIT 1" );
			$stmt->execute( array( $userID, $groupID ));
			
			if( $stmt->rowCount( ) > 0 ) {
				// Already Exists, Re-Activate It
				$row = $stmt->fetch( PDO::FETCH_OBJ );
				$stmt = $this->db->prepare( "UPDATE " . DB_MAIN . ".group_users SET group_user_status='active' WHERE group_user_id=?" );
				$stmt->execute( array( $row->group_user_id ));
			} else {
				// Doesn't Exist, Add New
				$stmt = $this->db->prepare( "INSERT INTO " . DB_MAIN . ".group_users VALUES( '0',?, ?, NOW( ), 'active' )" );
				$stmt->execute( array( $groupID, $userID ));
			}
			
		}
		
	}
	
	/**
	 * Get a count of all users available
	 */
	 
	public function fetchUserCount( ) {
		
		$stmt = $this->db->prepare( "SELECT COUNT(*) as userCount FROM " . DB_MAIN . ".users" );
		$stmt->execute( );
		
		$row = $stmt->fetch( PDO::FETCH_OBJ );
		
		return $row->userCount;
		
	}
	
	/**
	 * Fetch information about a user based on the passed in
	 * user ID, return false if non-existant
	 */
	
	public function fetchUser( $userID ) {
		
		$stmt = $this->db->prepare( "SELECT * FROM " . DB_MAIN . ".users WHERE user_id=? LIMIT 1" );
		$stmt->execute( array( $userID ) );
		
		if( $row = $stmt->fetch( PDO::FETCH_OBJ ) ) {
			return $row;
		} 
		
		return false;
		
	}
	
}

?>