local action = ARGV[1]

-- === GET ===
if action == "get" then
    local key = KEYS[1]
    local value = redis.call("GET", key)
    return value

-- === SET ===
elseif action == "set" then
    local key = KEYS[1]
    local value = ARGV[2]
    local ttl = tonumber(ARGV[3] or 60)
    redis.call("SET", key, value, "EX", ttl)
    return "OK"

-- === DEL ===
elseif action == "del" then
    local key = KEYS[1]
    redis.call("DEL", key)
    return "OK"

-- === DEL BY PATTERN ===
elseif action == "delByPattern" then
    local pattern = KEYS[1]
    local cursor = "0"
    local deleted = 0

    repeat
        local result = redis.call("SCAN", cursor, "MATCH", pattern, "COUNT", 1000)
        cursor = result[1]
        local keys = result[2]
        if #keys > 0 then
            redis.call("DEL", unpack(keys))
            deleted = deleted + #keys
        end
    until cursor == "0"

    return deleted

-- === RESET ===
elseif action == "reset" then
    redis.call("FLUSHALL")
    return "OK"

else
    return "[INVALID] Invalid action: " .. (action or "nil")
end
