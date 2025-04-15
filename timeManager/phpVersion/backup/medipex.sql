-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 05, 2025 at 01:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medipex`
--

-- --------------------------------------------------------

--
-- Table structure for table `checks`
--

CREATE TABLE `checks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(6) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timelogs`
--

CREATE TABLE `timelogs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `log_title` varchar(200) NOT NULL,
  `log_description` varchar(1000) NOT NULL,
  `log_color` varchar(100) NOT NULL,
  `log_day` int(11) NOT NULL,
  `log_hour` int(11) NOT NULL,
  `log_week` int(11) NOT NULL,
  `log_year` int(11) NOT NULL,
  `log_duration` varchar(200) NOT NULL,
  `log_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(200) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `otp_expires_at` datetime NOT NULL DEFAULT current_timestamp(),
  `verified` int(11) NOT NULL DEFAULT 0,
  `activated` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password`, `otp`, `otp_expires_at`, `verified`, `activated`) VALUES
(1, '', 'ahmed.hafez.cb@gmail.com', '+201025109575', 'af1c5f001c010d1e2b78eeb38830067dom24', '', '2025-04-05 12:57:35', 0, 1),
(2, '', 'nogaahmed92@gmail.com', '+201001981422', '836d13e6526d3983b130257eb8235654om21', '', '2025-04-05 13:00:52', 0, 1),
(3, '', 'hs1637012@gmail.com', '+201004272898', '15952b03620636af3cf7b95fc660e60eom19', '', '2025-04-05 13:00:52', 0, 1),
(4, '', 'yomna.eltayeb0@gmail.com', '+201090766805', 'c67d68eabc850f3646e4e86b1687f00bom24', '', '2025-04-05 13:00:52', 0, 1),
(5, '', 'Dr.mariamyasein@gmail.com', '+201008387801', 'c60ca3cf4a9885ff81e8340ecd2c320fom25', '', '2025-04-05 13:00:52', 0, 1),
(6, '', 'amiralsayed.work@gmail.com', '+201555127543', '82af2bddc7be7f6d65f8fe0c499045dfom26', '', '2025-04-05 13:00:52', 0, 1),
(7, '', 'Abdallahdigifly@gmail.com', '+201227097182', '02fd144ff4c670e5b9e12573c985ffeaom25', '', '2025-04-05 13:00:52', 0, 1),
(8, '', 'shehabsabre2019@gmail.com', '+201117702615', '40984694dd1d5fbace2dcf7eb3f5a8c3om25', '', '2025-04-05 13:00:52', 0, 1),
(9, '', 'gamalelhamalawy@gmail.com', '+201289500745', '9dffcbaf6445ca80f967e9dca6a6432aom25', '', '2025-04-05 13:00:52', 0, 1),
(10, '', 'adelgabr2932019@gmail.com', '+201121524545', 'f0ef07d05d72c97d768995dc541d1634om25', '', '2025-04-05 13:00:52', 0, 1),
(11, '', 'mohamedeltayeb098@gmail.com', '+201126435542', '0c53b8b3084b2041e38b6972a8bb6dfcom27', '', '2025-04-05 13:00:52', 0, 1),
(12, '', 'nadaesamn2e5@gmail.com', '+201128071125', '1a2628cffdc96dd69d7169ef28fa15abom22', '', '2025-04-05 13:00:52', 0, 1),
(13, '', 'ebrahimfathy2822@gmail.com', '+201221349388', 'c6af0293b5f5ceee05501ae89a137150om26', '', '2025-04-05 13:00:52', 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `checks`
--
ALTER TABLE `checks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timelogs`
--
ALTER TABLE `timelogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `checks`
--
ALTER TABLE `checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timelogs`
--
ALTER TABLE `timelogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
