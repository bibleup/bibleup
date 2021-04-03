
<?php

header('Content-type: application/json;charset=utf-8');

$ref = json_decode($_POST['json']);
//$ref = json_decode('{"book":"John", "chapter":"3", "verse":"3", "version":"kjv"}');
$getScripture = new GetScripture($ref);
$text = $getScripture->getResult();
echo json_encode($text);


class GetScripture {
	private $book;
	private $chapter;
	private $verse;
	private $version;
	private $bookId;
	private $chapterId;
	private $verseId;
	private $refId;
	private $refId2;
	private $verseRange;
	
	function __construct($bibleRef) {
		$this->book = $bibleRef->book;
		$this->chapter = $bibleRef->chapter;
		if (strpos($bibleRef->verse, '-') === false) {
			//no verse range
		$this->verse = $bibleRef->verse;
		} else {
			//verse range
			$v = explode('-', $bibleRef->verse);
			$this->verse = ($v[0] > $v[1]) ? ($v[1].'-'.$v[0]) : ($v[0].'-'.$v[1]);
			$this->verseRange = true;
		}
		$this->version = $bibleRef->version;
		$this->bookId;
		$this->chapterId;
		$this->verseId;
		$this->refId; 
		$this->refId2;
	}
	
	
	private function dbConnection() {
			$servername = 'localhost';
			$database = 'bible';
			$source = "mysql:host=$servername;dbname=$database";
			$username = 'admin';
			$password = 'ransomekutit1';
			$options = [
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, 
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
				];
			
			try {
					$pdo = new PDO($source, $username, $password, $options);
					//Connection successful
					return $pdo;
				} catch (PDOException $e) {
					//Connection Failed
					return 'CONNECTION FAILED: '.$e->getMessage();
				}
		}
		
		
	private function addZero($id, $length) {
		for ($x=1; $x <= $length; $x++) {
			if (strlen((string)$id) == $length) break;
			$id = '0'.$id;
		}
		
		return $id;
	}
	
	
	private function formatId($id, $length) {
			/**
			 * Format bookId, chapterId and verseId by adding zeros '0' behind 
			 * bookId = 5 (Deutoronomy) with length = 2 returns '05'
			 * This is necessary for subsequent database lookup 
			 */
			 if (strpos($id, '-') === false) {
			 	$id = $this->addZero($id, $length);
			 	return $id;
			 } else {
			 	$id = explode('-', $id);
			 	$id[0] = $this->addZero($id[0], $length);
			 	$id[1] = $this->addZero($id[1], $length);
			 	return $id[0].'-'.$id[1];
			 }
		}
		
		
	
	
	
	private function setId($conn) {
		$query = $conn->prepare("SELECT * FROM key_abbreviations_english WHERE a = ?");
		$query2 = $conn->prepare("SELECT * FROM key_english WHERE b = ?");
		//get book id
		$query->execute([$this->book]);
		$result = $query->fetchAll();
		$bookId = $result[0]['b'];
		//get real book name
		$query2->execute([$bookId]);
		$result2 = $query2->fetchAll();
		$realBook = $result2[0]['n'];
		
		//set ids
		$this->book = $realBook;
		$this->bookId = $this->formatId($bookId, 2);
		$this->chapterId = $this->formatId($this->chapter, 3);
		$this->verseId = $this->formatId($this->verse, 3);
		
		if (!$this->verseRange) {
			//complete book ref - e.g 01005001
			$this->refId = $this->bookId.$this->chapterId.$this->verseId;
		} else {
			//if verse contains '-' then it is a range (refId = first verse, refId2 = last verse in range)
			$verse = explode('-', $this->verseId);
			$this->refId = $this->bookId.$this->chapterId.$verse[0];
			$this->refId2 = $this->bookId.$this->chapterId.$verse[1];
		}
	}
	
	
	
	private function getText($conn) {
		$version = "t_".strtolower($this->version);
		$refId = $this->refId;
		$refId2 = $this->refId2;
		
		if (!$refId2) {
			//No verse range
			$cQuery = "SELECT * FROM $version WHERE id=?";
			$query = $conn->prepare($cQuery);
			$query->execute([$this->refId]);
			$result = $query->fetchAll();
			//get text
			foreach ($result as $row) {
			$text[] = $row['t'];
			}
		} else if ($refId2) {
			//there is verse range
			$cQuery = "SELECT * FROM $version WHERE id BETWEEN ? AND ? LIMIT 5";
			$query = $conn->prepare($cQuery);
			$query->execute([$refId, $refId2]);
			$result = $query->fetchAll();
			//get text
			foreach ($result as $row) {
				$text[] = $row['t'];
			}
		}
		
		return $text;
	}
	
	
	
	public function getResult() {
		$conn = $this->dbConnection();
		$this->setId($conn);
		$text = $this->getText($conn);
		$bible = $this->book.' '.$this->chapter.':'.$this->verse;
		
		
		//$response = ['result' => 'PHP has taken over!!JESUS!!!', 'book' => $this->book, 'chapter' => $this->chapter, 'verse' => $this->verse, 'version' => $this->version, 'book ID' => $this->bookId, 'chapter ID' => $this->chapterId, 'verse ID' => $this->verseId, 'text' => $result];
		$response = [
			'ref' => $bible, 
			'text' => $text, 
			'chapter' => $this->chapter, 
			'verse' => $this->verse,
			'version' => $this->version
			];
			
		return $response;
	}
	
	
	
	
	
	
	
	
	
	
	
	
}
?>