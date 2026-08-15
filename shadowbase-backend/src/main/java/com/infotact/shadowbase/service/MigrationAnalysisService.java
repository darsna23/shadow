package com.infotact.shadowbase.service;

import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.alter.Alter;
import net.sf.jsqlparser.statement.alter.AlterExpression;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses a migration script's AST (via JSqlParser) and warns the developer
 * if it drops a column — before it ever runs against shadowed traffic.
 * This is the "bonus" static-analysis layer described in the project plan.
 */
@Service
public class MigrationAnalysisService {

    public List<String> analyze(String sql) {
        List<String> warnings = new ArrayList<>();
        for (String single : sql.split(";")) {
            if (single.isBlank()) continue;
            try {
                Statement stmt = CCJSqlParserUtil.parse(single.trim());
                if (stmt instanceof Alter alter) {
                    for (AlterExpression expr : alter.getAlterExpressions()) {
                        if (expr.getOperation() != null &&
                                expr.getOperation().name().equalsIgnoreCase("DROP")) {
                            warnings.add("Warning: '" + alter.getTable().getName() +
                                    "' drops column '" + expr.getColumnName() +
                                    "' — check if it's still queried by live traffic.");
                        }
                    }
                }
            } catch (Exception e) {
                warnings.add("Could not parse statement: " + single.trim());
            }
        }
        return warnings;
    }
}
