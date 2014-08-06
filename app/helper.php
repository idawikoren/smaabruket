<?php

class smaabruket_kalender
{
	public $weeks_show_before = 0;
	public $weeks_show_after = 25;
	
	public function get_data()
	{
		//$datas = $this->get_xml();

		$d = new GetData();
		$datas = $d->events;
		if (!$datas) return null;

		$from = new \DateTime();
		$from->setTimeZone(new DateTimeZone("Europe/Oslo"));
		$from->modify(sprintf("-%d days", $from->format("N")-1));
		$from->modify(sprintf("-%d weeks", $this->weeks_show_before));
		$from->setTime(0, 0, 0);
		$from = $from->format("U");

		$to = new \DateTime();
		$to->setTimeZone(new DateTimeZone("Europe/Oslo"));
		$to->modify(sprintf("+%d days", 7-$to->format("N")));
		$to->modify(sprintf("+%d weeks", $this->weeks_show_after));
		$to->setTime(23, 59, 59);
		$to = $to->format("U");

		$start = array();
		$items = array();
		foreach ($datas as $row)
		{
			$startTime = strtotime($row[0]);
			$endTime = strtotime($row[1]);

			if ($startTime < $from) continue;
			if ($endTime > $to) continue;

			$start[] = $startTime;
			$items[] = array(
				"start" => $startTime,
				"end" => $endTime,
				"type" => $row[2]
			);
		}

		array_multisort($start, SORT_ASC, $items);
		return $items;
	}
	
	public function get_calendar_status()
	{
		$items = $this->get_data();
		if (!$items) return null;

		$date_start = new DateTime();
		$date_start->setTimeZone(new DateTimeZone("Europe/Oslo"));
		$date_start->setTime(0, 0, 0);
		$date_start->modify("-".($this->weeks_show_before*7)." days");
		while ($date_start->format("N") != 1)
		{
			$date_start->modify("-1 day");
		}
		
		$days = array();
		$show_days = 7 * $this->weeks_show_before + 7 * $this->weeks_show_after;
		for ($i = 0; $i < $show_days; $i++)
		{
			$days[$date_start->format("Y-m-d")] = false;
			$date_start->modify("+1 day");
			
			// ikke vis datoer langt ut i 2012 enda
			//if ($date_start->format("Y-m-d") == "2012-01-16") break;
		}
		
		foreach ($items as $item)
		{
			$start = new DateTime("@".$item['start']);
			$start->setTimeZone(new DateTimeZone("Europe/Oslo"));
			$start->setTime(0, 0, 0);
			#if ($start->format("H:i:s") !== "00:00:00") continue;
			
			$end = new DateTime("@".$item['end']);
			$end->setTimeZone(new DateTimeZone("Europe/Oslo"));
			
			// marker datoene med kalendernavnet
			do
			{
				$day = $start->format("Y-m-d");
				if (isset($days[$day]))
				{
					$days[$day] = $item['type'];
				}
				$start->modify("+1 day");
			} while ($start->format("U") < $end->format("U"));
		}
		
		return $days;
	}
}



class GetData
{
	const CACHE_TIMEOUT = 900;

	public $events;
	public $cache_file;

	public function __construct()
	{
		$this->cache_file = dirname(__FILE__)."/cache.txt";

		if (!$this->get_cache())
		{
			$url = trim(@file_get_contents(dirname(__FILE__)."/url.txt"));
			if (!$url) return;

			$data = json_decode(file_get_contents($url), true);
			$this->parse($data);

			file_put_contents($this->cache_file, json_encode($this->events));
		}
	}

	private function get_cache()
	{
		if (!file_exists($this->cache_file)) return false;

		$t = filemtime($this->cache_file);
		if ($t > time() || $t < time()-static::CACHE_TIMEOUT) return false;

		$this->events = json_decode(file_get_contents($this->cache_file), true);
		return true;
	}

	private function parse($data)
	{
		$cur_row = array();
		$i = 5;

		foreach ($data['feed']['entry'] as $cell)
		{
			if (!preg_match("/^([A-Z]+)(\\d+)$/", $cell['title']['$t'], $matches)) continue;
			$v = $cell['content']['$t'];

			$row = $matches[2];
			$col = $matches[1];

			if ($row < 5) continue;

			if ($row != $i) {
				$this->add_row($cur_row);
				$cur_row = array();
				$i = $row;
			}

			$cur_row[$col] = $v;
		}

		if ($cur_row) $this->add_row($cur_row);
	}

	private function add_row($row)
	{
		if (!isset($row['A'])) return;
		if (!isset($row['B'])) return;
		$type = $this->get_type($row);
		
		if ($type != 'AVLYST')
			$this->events[] = array($row['A'], $row['B'], $type);
	}

	private function get_type($row)
	{
		if (empty($row['E'])) return 'HYTTESTYRET';
		
		// types: UTLEID, RESERVERT, RESERVERT-HS, HYTTESTYRET, BEBOERHELG

		if ($row['E'] == 'HYTTESTYRET') {
			return 'HYTTESTYRET';
		}

		if ($row['E'] == 'RESERVERT') {
			return 'RESERVERT-HS';
		}

		if ($row['E'] == 'BEBOERHELG') {
			return 'BEBOERHELG';
		}

		if ($row['E'] == 'AVLYST') {
			return 'AVLYST';
		}

		// antar UTLEID eller ANNET
		return (empty($row['I']) || $row['I'] == "" || (!empty($row['H']) && $row['H'] != "")) ? 'UTLEID' : 'RESERVERT';
	}
}